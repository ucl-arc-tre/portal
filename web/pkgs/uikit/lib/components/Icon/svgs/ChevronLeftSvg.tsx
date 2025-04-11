import { memo } from 'react';

const ChevronLeftSvg = ({ ...props }) => {
  const { title, ...rest } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      strokeWidth='2'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...rest}
    >
      {title && <title>{title}</title>}
      <polyline points='15 18 9 12 15 6' />
    </svg>
  );
};

export default memo(ChevronLeftSvg);
