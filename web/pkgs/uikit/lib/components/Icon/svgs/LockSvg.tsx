import { memo } from 'react';

const LockSvg = ({ ...props }) => {
  const { title, ...rest } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...rest}
    >
      {title && <title>{title}</title>}
      <rect
        x='3'
        y='11'
        width='18'
        height='11'
        rx='2'
        ry='2'
      />
      <path d='M7 11V7a5 5 0 0 1 10 0v4' />
    </svg>
  );
};

export default memo(LockSvg);
