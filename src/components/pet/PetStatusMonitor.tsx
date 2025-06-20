import React, { useEffect, useState } from 'react';
import { AlertTriangle, Heart, Apple, Bed, Skull } from 'lucide-react';
import { usePet } from '../../context/PetContext';

interface PetStatusAlert {
  id: string;
  type: 'warning' | 'critical' | 'death';
  title: string;
  message: string;
  icon: React.ComponentType<any>;
  timestamp: number;
}

const PetStatusMonitor: React.FC = () => {
  const { pet } = usePet();
  const [alerts, setAlerts] = useState<PetStatusAlert[]>([]);

  useEffect(() => {
    const newAlerts: PetStatusAlert[] = [];
    const now = Date.now();

    // Death alert
    if (!pet.isAlive) {
      newAlerts.push({
        id: 'death',
        type: 'death',
        title: 'Pet Has Died',
        message: 'Your pet has passed away! Buy a Phoenix Feather from the shop to revive them.',
        icon: Skull,
        timestamp: now
      });
    } else {
      // Critical condition
      if (pet.mood === 'dying') {
        newAlerts.push({
          id: 'dying',
          type: 'critical',
          title: 'Critical Condition!',
          message: 'Your pet is dying! Take immediate action to save them!',
          icon: AlertTriangle,
          timestamp: now
        });
      }

      // Starvation warning
      if (pet.hunger < 15) {
        newAlerts.push({
          id: 'hunger',
          type: 'critical',
          title: 'Starving!',
          message: 'Your pet is starving and needs food immediately!',
          icon: Apple,
          timestamp: now
        });
      } else if (pet.hunger < 30) {
        newAlerts.push({
          id: 'hunger-low',
          type: 'warning',
          title: 'Getting Hungry',
          message: 'Your pet is getting hungry. Consider feeding them soon.',
          icon: Apple,
          timestamp: now
        });
      }

      // Health warnings
      if (pet.health < 20) {
        newAlerts.push({
          id: 'health',
          type: 'critical',
          title: 'Very Poor Health!',
          message: 'Your pet\'s health is critically low! Buy medicine now!',
          icon: Heart,
          timestamp: now
        });
      } else if (pet.health < 40) {
        newAlerts.push({
          id: 'health-low',
          type: 'warning',
          title: 'Poor Health',
          message: 'Your pet\'s health is declining. Consider buying medicine.',
          icon: Heart,
          timestamp: now
        });
      }

      // Sickness warnings
      if (pet.sickness > 80) {
        newAlerts.push({
          id: 'sickness',
          type: 'critical',
          title: 'Seriously Ill!',
          message: 'Your pet is very sick and needs immediate medical attention!',
          icon: Bed,
          timestamp: now
        });
      } else if (pet.sickness > 50) {
        newAlerts.push({
          id: 'sickness-moderate',
          type: 'warning',
          title: 'Feeling Unwell',
          message: 'Your pet is getting sick. Consider buying medicine.',
          icon: Bed,
          timestamp: now
        });
      }

      // Energy warnings
      if (pet.energy < 10) {
        newAlerts.push({
          id: 'energy',
          type: 'warning',
          title: 'Exhausted',
          message: 'Your pet is exhausted and needs rest or an energy boost.',
          icon: Bed,
          timestamp: now
        });
      }

      // Happiness warnings
      if (pet.happiness < 20) {
        newAlerts.push({
          id: 'happiness',
          type: 'warning',
          title: 'Very Sad',
          message: 'Your pet is very unhappy. Play with them or buy toys!',
          icon: Heart,
          timestamp: now
        });
      }
    }

    setAlerts(newAlerts);
  }, [pet.isAlive, pet.mood, pet.hunger, pet.health, pet.sickness, pet.energy, pet.happiness]);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map(alert => {
        const Icon = alert.icon;
        const bgColor = alert.type === 'death' ? 'bg-black' : 
                       alert.type === 'critical' ? 'bg-red-500' : 'bg-orange-500';
        
        return (
          <div
            key={alert.id}
            className={`${bgColor} text-white p-4 rounded-lg shadow-lg animate-slide-in-right`}
            style={{ backgroundColor: alert.type === 'death' ? '#000' : undefined }}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                <p className="text-sm opacity-90">{alert.message}</p>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-white/70 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PetStatusMonitor;
