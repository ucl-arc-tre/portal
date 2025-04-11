import { memo } from 'react';

const AvatarSvg = ({ ...props }) => {
  const { title, ...rest } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      stroke='none'
      {...rest}
    >
      {title && <title>{title}</title>}
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M4 20.9995C4.49232 17.0534 7.8586 14 11.938 14C16.0175 14 19.5077 17.0539 20 21C18 23 15 24 12 24C9 24 6 23 4 20.9995Z'
      />
      <circle
        cx='12'
        cy='9'
        r='4'
      />
    </svg>
  );
};

export default memo(AvatarSvg);
