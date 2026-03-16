import { useLottoMachine } from '../hooks/useLottoMachine';

interface LottoMachineProps {
  isSpinning: boolean;
  selectedIds: number[];
}

export function LottoMachine({ isSpinning, selectedIds }: LottoMachineProps) {
  const { canvasRef } = useLottoMachine({ isSpinning, selectedIds });

  return (
    <div className="relative w-full aspect-square max-w-[350px] md:max-w-[400px] mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'auto' }}
      />
      {isSpinning && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-purple-400 animate-ping" />
        </div>
      )}
    </div>
  );
}
