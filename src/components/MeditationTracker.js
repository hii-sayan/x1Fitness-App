import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

export const useMeditationValidation = () => {
  const [isValid, setIsValid] = useState(true);
  const THRESHOLD = 0.3;

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000);
    
    const subscription = Accelerometer.addListener(data => {
      const acceleration = Math.sqrt(
        data.x ** 2 + 
        data.y ** 2 + 
        data.z ** 2
      );
      setIsValid(acceleration < THRESHOLD);
    });

    return () => subscription.remove();
  }, []);

  return { isValid };
};
