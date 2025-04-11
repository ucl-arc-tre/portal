import { memo } from 'react';

const XCircleSvg = ({ ...props }) => {
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
      <circle
        cx='12'
        cy='12'
        r='10'
      />
      <line
        x1='15'
        y1='9'
        x2='9'
        y2='15'
      />
      <line
        x1='9'
        y1='9'
        x2='15'
        y2='15'
      />
    </svg>
  );
};

export default memo(XCircleSvg);
