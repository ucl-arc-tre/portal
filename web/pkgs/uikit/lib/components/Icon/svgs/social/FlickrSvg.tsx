import { memo } from 'react';

const FlickrSvg = ({ ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      {...props}
    >
      {props.title && <title>{props.title}</title>}

      <path d='M11 12C11 14.7614 8.76142 17 6 17C3.23858 17 1 14.7614 1 12C1 9.23858 3.23858 7 6 7C8.76142 7 11 9.23858 11 12Z' />
      <path d='M23 12C23 14.7614 20.7614 17 18 17C15.2386 17 13 14.7614 13 12C13 9.23858 15.2386 7 18 7C20.7614 7 23 9.23858 23 12Z' />
    </svg>
  );
};

export default memo(FlickrSvg);
