import StateBody from './Body';
import StateHeader from './Header';

export default function StateView() {
  return (
    <div className="flex flex-col h-full">
      <StateHeader />
      <div className="flex flex-col flex-grow">
        <StateBody />
      </div>
    </div>
  );
}
