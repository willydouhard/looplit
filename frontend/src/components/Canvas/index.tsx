import StateMergeEditor from '../StateMergeEditor';
import CanvasChat from './Chat';
import CanvasHeader from './Header';
import { canvasState } from '@/state';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

let [x, y] = [0, 0];

const CodeCanvas = () => {
  const canvas = useRecoilValue(canvasState);

  useEffect(() => {
    if (canvas) {
      x = canvas.openCoords.x;
      y = canvas.openCoords.y;
    }
  }, [canvas]);

  const isOpen = !!canvas;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            clipPath: `circle(0px at ${canvas.openCoords.x}px ${canvas.openCoords.y}px)`,
            opacity: 0
          }}
          animate={{
            clipPath: `circle(150% at ${canvas.openCoords.x}px ${canvas.openCoords.y}px)`,
            opacity: 1
          }}
          exit={{
            clipPath: `circle(0px at ${x}px ${y}px)`,
            opacity: 0
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="h-screen w-screen bg-card fixed z-[100] flex"
        >
          {/* Chat Sidebar */}
          <motion.div
            initial={{ x: '30%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '30%', opacity: 0 }}
            transition={{
              ease: [0.4, 0, 0.2, 1],
              duration: 0.5,
              delay: 0.2
            }}
            className="w-[20%] h-full bg-background relative z-1 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <CanvasChat />
          </motion.div>
          {/* Main Code Sheet */}
          <motion.div
            style={{ boxShadow: '-25px 0px 41px -43px rgba(0,0,0,0.45)' }}
            className="w-[80%] flex flex-col h-full bg-card border-l px-6 relative z-2"
          >
            <motion.div
              initial={{ y: '20%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '20%', opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 30
              }}
              className="flex-grow flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <CanvasHeader />
              <StateMergeEditor
                value={canvas.aiState}
                readOnly={canvas.running}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CodeCanvas;
