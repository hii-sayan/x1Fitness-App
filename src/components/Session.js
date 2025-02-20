import CountDown from 'react-native-countdown-component';
import { useMeditationValidation } from './MeditationTracker';

export default function Session({ onComplete }) {
  const { isValid } = useMeditationValidation();
  const [errorCount, setErrorCount] = useState(0);

  return (
    <CountDown
      size={300}
      until={300} // 5 minutes
      onFinish={() => errorCount < 3 ? onComplete() : null}
      digitStyle={{backgroundColor: isValid ? '#FFF' : '#ff0000'}}
      timeToShow={['M', 'S']}
      timeLabels={{m: 'Min', s: 'Sec'}}
      onChange={(time) => !isValid && setErrorCount(c => c+1)}
    />
  );
}