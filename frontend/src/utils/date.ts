export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const formatTime12 = (dateString: string) => {
  const date = new Date(dateString);
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

export const todayISO = () => {
  new Date().toISOString().split('T')[0]
};