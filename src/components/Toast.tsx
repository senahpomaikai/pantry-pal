import { useStore } from '../store';
import { useVariantConfig } from '../variants';
import { Icon } from './Icon';

export function Toast() {
  const { state } = useStore();
  const { impactMessage } = useVariantConfig();
  if (!state.toast.text || (impactMessage && state.impact)) return null;
  return (
    <div className="toast" role="status">
      <Icon name="check" style={{ color: '#FCEBD0' }} />
      <span>{state.toast.text}</span>
    </div>
  );
}
