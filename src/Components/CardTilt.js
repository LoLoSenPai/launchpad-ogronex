import React, { useState } from 'react';

function throttle(func, delay) {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

const CardTilt = () => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const onMouseMove = throttle(e => {
      const card = e.currentTarget;
      const box = card.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      const centerX = box.width / 2;
      const centerY = box.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      setRotate({ x: rotateX, y: rotateY });
    }, 100);

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
        className='relative transition-[all_400ms_cubic-bezier(0.03,0.98,0.52,0.99)_0s] will-change-transform'
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
          transition: 'all 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99) 0s',
        }}
    >
      <div className='group relative flex h-full w-full select-none items-center justify-center'>
        <div className='duration-600 absolute -inset-0.5 -z-10 rounded-lg transition group-hover:opacity-75' />
          <img className="w-full scale-125" src="./Images/prize-maschine-infected-dalmatians.png" alt="maschine with a hook to grab prize" />
        </div>
    </div>
  );
};

export default CardTilt;
