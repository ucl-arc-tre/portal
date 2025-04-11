import { memo } from 'react';

const ListSvg = ({ ...props }) => {
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
      <line
        x1='8'
        y1='6'
        x2='21'
        y2='6'
      />
      <line
        x1='8'
        y1='12'
        x2='21'
        y2='12'
      />
      <line
        x1='8'
        y1='18'
        x2='21'
        y2='18'
      />
      <line
        x1='3'
        y1='6'
        x2='3.01'
        y2='6'
      />
      <line
        x1='3'
        y1='12'
        x2='3.01'
        y2='12'
      />
      <line
        x1='3'
        y1='18'
        x2='3.01'
        y2='18'
      />
    </svg>
  );
};

export default memo(ListSvg);
