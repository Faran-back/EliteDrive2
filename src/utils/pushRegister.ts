const VAPID_PUBLIC_KEY = "BHC5We6pu82m84b2AiBtAanxxzMvORuswuq6bIdqHIrEkhEP95igPuuGMUxdmYmh9fctVsAcCEET1RYAZNt2_oE";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function checkPushSubscription(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('Error checking push subscription:', error);
    return false;
  }
}

export interface PushRegistrationResult {
  success: boolean;
  reason?: 'iframe' | 'permission_denied' | 'unsupported' | 'error';
}

export async function registerPushNotifications(): Promise<PushRegistrationResult> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    console.warn('Push messaging or Service Worker is not supported in this browser.');
    return { success: false, reason: 'unsupported' };
  }

  // Check if we are running inside an iframe
  const isInIframe = window.self !== window.top;
  if (isInIframe && window.Notification.permission !== 'granted') {
    console.log('[WebPush] Push registration is not available inside the preview iframe. Please open the app in a new tab.');
    return { success: false, reason: 'iframe' };
  }

  if (window.Notification.permission === 'denied') {
    console.log('[WebPush] Push registration blocked: Notification permission has been denied by the user.');
    return { success: false, reason: 'permission_denied' };
  }

  try {
    // 1. Register Service Worker
    console.log('Registering Service Worker...');
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    console.log('Service Worker registered successfully with scope:', registration.scope);

    // 2. Request Notification Permission
    const permission = await window.Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission was denied.');
      return { success: false, reason: 'permission_denied' };
    }

    // 3. Subscribe to Push Manager
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    };

    console.log('Subscribing to Push Manager...');
    const subscription = await registration.pushManager.subscribe(subscribeOptions);
    console.log('Push subscription generated successfully:', subscription);

    // 4. Send subscription details to server
    const token = localStorage.getItem('elitedrive_token');
    if (!token) {
      console.warn('No authentication token found. Delaying subscription upload.');
      return { success: true };
    }

    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subscription })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    console.log('Push subscription successfully synchronized with the backend.');
    return { success: true };
  } catch (error) {
    console.error('Failed to register/subscribe to push notifications:', error);
    return { success: false, reason: 'error' };
  }
}
