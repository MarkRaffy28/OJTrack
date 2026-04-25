export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true
  });
};

export const formatDateForInput = (dateString: string) => {
  return new Date(dateString).toISOString().split("T")[0];
};

export const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const formatTime12 = (timeString: string) => {
  if (!timeString) return '';
  
  // Handle HH:MM:SS or HH:MM formats from MySQL TIME columns
  if (timeString.includes(':') && !timeString.includes('-') && !timeString.includes('T')) {
    const [h, m] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m), 0);
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const date = new Date(timeString);
  if (isNaN(date.getTime())) return timeString; // Return as is if still invalid

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good Morning";
  else if (hour >= 12 && hour < 18) return "Good Afternoon";
  else if (hour >= 18 && hour < 22) return "Good Evening";
  else return "Good Night";
};

export const getDateTime12 = () => {
  const date = new Date();
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).replace('-', ',')
    .replace(',', ', ')
    .replace(',  ', ', ')
    .replace(/(\d{4}),/, '$1 |');
};

export const todayISO = () => {
  return new Date().toISOString().split('T')[0];
};

export const thisMonthISO = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
