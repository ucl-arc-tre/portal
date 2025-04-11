import { memo } from 'react';

const InstagramSvg = ({ ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      {...props}
    >
      {props.title && <title>{props.title}</title>}

      <path d='M11.9987 7.97012C9.77942 7.97012 7.97004 9.77951 7.97004 11.9987C7.97004 14.218 9.77942 16.0274 11.9987 16.0274C14.2179 16.0274 16.0273 14.218 16.0273 11.9987C16.0273 9.77951 14.2179 7.97012 11.9987 7.97012Z' />
      <path d='M22.915 7.4603C22.8351 5.7009 22.4252 4.14143 21.1356 2.85187C19.8561 1.5723 18.2966 1.17244 16.5372 1.08247C14.7178 0.972509 9.27968 0.972509 7.4603 1.08247C5.7009 1.16244 4.14143 1.5723 2.85187 2.85187C1.56231 4.13143 1.17244 5.7009 1.08247 7.4603C0.972509 9.27968 0.972509 14.7178 1.08247 16.5372C1.16244 18.2966 1.5723 19.8561 2.86187 21.1456C4.15143 22.4352 5.71089 22.8351 7.47029 22.925C9.28967 23.025 14.7278 23.025 16.5372 22.925C18.2966 22.8451 19.8561 22.4352 21.1456 21.1456C22.4352 19.8561 22.8351 18.2966 22.925 16.5372C23.025 14.7178 23.025 9.27968 22.925 7.47029L22.915 7.4603ZM11.9987 18.1966C8.56992 18.1966 5.80086 15.4276 5.80086 11.9987C5.80086 8.56992 8.56992 5.80086 11.9987 5.80086C15.4276 5.80086 18.1966 8.56992 18.1966 11.9987C18.1966 15.4276 15.4276 18.1966 11.9987 18.1966ZM18.4565 6.99046C17.6568 6.99046 17.007 6.34068 17.007 5.54095C17.007 4.74122 17.6568 4.09145 18.4565 4.09145C19.2563 4.09145 19.9061 4.74122 19.9061 5.54095C19.9061 6.34068 19.2563 6.99046 18.4565 6.99046Z' />
    </svg>
  );
};

export default memo(InstagramSvg);
