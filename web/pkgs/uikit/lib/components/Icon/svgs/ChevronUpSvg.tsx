import { memo } from 'react';

const ChevronUpSvg = ({ ...props }) => {
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
      <polyline points='18 15 12 9 6 15' />
    </svg>
  );
};

export default memo(ChevronUpSvg);

export const DATA_URI = `data:image/svg+xml;utf8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2024%2024'%20fill%3D'none'%20stroke%3D'currentColor'%20strokeWidth%3D'2'%20strokeLinecap%3D'round'%20strokeLinejoin%3D'round'%3E%3Cpolyline%20points%3D'18%2015%2012%209%206%2015'%2F%3E%3C%2Fsvg%3E`;
