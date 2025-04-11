import { memo } from 'react';

const ChevronDownSvg = ({ ...props }) => {
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
      <polyline points='6 9 12 15 18 9' />
    </svg>
  );
};

export default memo(ChevronDownSvg);

// Used by Select
const DATA_URI =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22{{COLOUR}}%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20width%3D%2224%22%20height%3D%2224%22%20class%3D%22ucl-icon%20css-4bxmzw%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E';
export const dataUri = (colour: string) =>
  DATA_URI.replace(
    '{{COLOUR}}',
    encodeURIComponent(colour)
  );
