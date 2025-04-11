import { memo } from 'react';

const FacebookSvg = ({ ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      {...props}
    >
      {props.title && <title>{props.title}</title>}

      <path d='M24 12.0733C24 5.40541 18.6274 0 12 0C5.37258 0 0 5.40541 0 12.0733C0 18.0994 4.3882 23.0943 10.125 24V15.5633H7.07812V12.0733H10.125V9.41343C10.125 6.38755 11.9166 4.71615 14.6576 4.71615C15.9705 4.71615 17.3438 4.95195 17.3438 4.95195V7.92313H15.8306C14.34 7.92313 13.875 8.85386 13.875 9.80864V12.0733H17.2031L16.6711 15.5633H13.875V24C19.6118 23.0943 24 18.0994 24 12.0733Z' />
    </svg>
  );
};

export default memo(FacebookSvg);
