// Subject icon mapping for Past Papers
export const getSubjectIcon = (subject) => {
  const iconMap = {
    'Mathematics': '🔢',
    'Math': '🔢',
    'English': '📘',
    'Physics': '⚛️',
    'Chemistry': '⚗️',
    'Biology': '🧬',
    'Computer Science': '💻',
    'CS': '💻',
    'History': '📜',
    'Geography': '🌍',
    'Economics': '📈',
    'Business': '💼',
    'Art': '🎨',
    'Music': '🎵',
    'Physical Education': '⚽',
    'PE': '⚽',
    'Literature': '📖',
    'Philosophy': '🤔',
    'Psychology': '🧠',
    'Engineering': '⚙️',
  };
  
  // Try exact match first
  if (iconMap[subject]) {
    return iconMap[subject];
  }
  
  // Try case-insensitive match
  const lowerSubject = subject.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (key.toLowerCase() === lowerSubject || lowerSubject.includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  // Default icon
  return '📄';
};

export const getSubjectColor = (subject) => {
  const colorMap = {
    'Mathematics': 'bg-blue-500',
    'Math': 'bg-blue-500',
    'English': 'bg-green-500',
    'Physics': 'bg-purple-500',
    'Chemistry': 'bg-red-500',
    'Biology': 'bg-emerald-500',
    'Computer Science': 'bg-indigo-500',
    'CS': 'bg-indigo-500',
    'History': 'bg-amber-500',
    'Geography': 'bg-teal-500',
    'Economics': 'bg-orange-500',
    'Business': 'bg-pink-500',
    'Art': 'bg-rose-500',
    'Music': 'bg-violet-500',
  };
  
  if (colorMap[subject]) {
    return colorMap[subject];
  }
  
  // Try case-insensitive
  const lowerSubject = subject.toLowerCase();
  for (const [key, color] of Object.entries(colorMap)) {
    if (key.toLowerCase() === lowerSubject) {
      return color;
    }
  }
  
  return 'bg-gray-500';
};

