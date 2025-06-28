import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export const getStatusIcon = (status) => {
  switch (status) {
    case 'safe':
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    case 'danger':
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'safe':
      return 'bg-green-500/20 border-green-500/30 text-green-300';
    case 'warning':
      return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
    case 'danger':
      return 'bg-red-500/20 border-red-500/30 text-red-300';
    default:
      return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
  }
};