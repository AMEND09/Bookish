let notificationPermission: NotificationPermission = 'default';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    notificationPermission = 'granted';
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (notificationPermission === 'granted') {
    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    });
  }
};

export const scheduleReadingReminder = (reminderTime: string) => {
  const now = new Date();
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);
  
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  
  const timeUntilReminder = targetTime.getTime() - now.getTime();
  
  setTimeout(() => {
    showNotification('Reading Reminder', {
      body: "It's time for your daily reading session!",
      tag: 'reading-reminder',
    });
  }, Math.min(timeUntilReminder, 2147483647));
};

export const showReadingStreakNotification = (streakDays: number) => {
  if (streakDays > 1) {
    showNotification('Reading Streak!', {
      body: `Congratulations! You've maintained your reading streak for ${streakDays} days!`,
      tag: 'reading-streak',
    });
  }
};

export const showGoalAchievedNotification = (goalType: string, value: number) => {
  showNotification('Goal Achieved!', {
    body: `Great job! You've reached your ${goalType} goal of ${value}!`,
    tag: 'goal-achieved',
  });
};

export const initNotifications = () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  }
  requestNotificationPermission();
};

export const setDailyReminder = (reminderTime: string) => {
  const now = new Date();
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);
  
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  
  const timeUntilReminder = targetTime.getTime() - now.getTime();
  
  setTimeout(() => {
    showNotification('Daily Reading Reminder', {
      body: "Don't forget to read today! Keep your streak going!",
      tag: 'daily-reminder',
    });
    
    setDailyReminder(reminderTime);
  }, timeUntilReminder);
};