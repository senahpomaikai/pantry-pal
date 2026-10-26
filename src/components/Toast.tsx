import { useStore } from '../store';
import { Icon } from './Icon';

export function Toast() {
  const { state } = useStore();
  if (!state.toast.text) return null;
  return (
    <div className="toast" role="status">
      <Icon name="check" style={{ color: '#FCEBD0' }} />
      <span>{state.toast.text}</span>
    </div>
  );
}
