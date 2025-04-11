import { memo } from 'react';

const GridSvg = ({ ...props }) => {
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
        y='3'
        width='7'
        height='7'
      />
      <rect
        x='14'
        y='3'
        width='7'
        height='7'
      />
      <rect
        x='14'
        y='14'
        width='7'
        height='7'
      />
      <rect
        x='3'
        y='14'
        width='7'
        height='7'
      />
    </svg>
  );
};

export default memo(GridSvg);
