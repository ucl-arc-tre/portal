import { memo } from 'react';

const EmptySvg = ({ ...props }) => {
  const { title, children, ...rest } = props;

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
      {children}
    </svg>
  );
};

export default memo(EmptySvg);
