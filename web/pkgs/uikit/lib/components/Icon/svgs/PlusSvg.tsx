import { memo } from 'react';

const PlusSvg = ({ ...props }) => {
  const { title, ...rest } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...rest}
    >
      {title && <title>{title}</title>}
      <line
        x1='12'
        y1='5'
        x2='12'
        y2='19'
      />
      <line
        x1='5'
        y1='12'
        x2='19'
        y2='12'
      />
    </svg>
  );
};

export default memo(PlusSvg);
