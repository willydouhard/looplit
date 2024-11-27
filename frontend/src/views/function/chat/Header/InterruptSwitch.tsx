import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import useInteraction from '@/hooks/useInteraction';

export default function InterruptSwitch() {
  const { setInterrupt } = useInteraction();
  return null;
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="interrupt">Break</Label>
      <Switch onCheckedChange={(c) => setInterrupt(c)} id="interrupt" />
    </div>
  );
}
