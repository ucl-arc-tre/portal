import { memo } from 'react';

const TerminalSvg = ({ ...props }) => {
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
      <polyline points='4 17 10 11 4 5' />
      <line
        x1='12'
        y1='19'
        x2='20'
        y2='19'
      />
    </svg>
  );
};

export default memo(TerminalSvg);
