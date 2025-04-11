import { memo } from 'react';
import { css, cx } from '@emotion/css';
import { Icon, Link, LinkProps, useTheme } from '../..';

export const NAME = 'ucl-uikit-footer__social-link';

export interface SocialLinkProps extends LinkProps {
  socialNetwork:
    | 'facebook'
    | 'flickr'
    | 'instagram'
    | 'soundcloud'
    | 'tiktok'
    | 'x'
    | 'youtube';
  testId?: string;
}

const SocialLink = ({
  socialNetwork,
  testId = NAME,
  className,
  ...props
}: SocialLinkProps) => {
  const href = {
    facebook: 'https://www.facebook.com/uclofficial/',
    flickr: 'https://www.flickr.com/groups/ucl/',
    instagram: 'https://www.instagram.com/ucl/',
    soundcloud: 'https://soundcloud.com/uclsound',
    tiktok: 'https://www.tiktok.com/@uclofficial',
    x: 'https://x.com/ucl',
    youtube: 'https://www.youtube.com/ucltv',
  }[socialNetwork];

  const title = {
    facebook: 'Facebook',
    flickr: 'Flickr',
    instagram: 'Instagram',
    soundcloud: 'SoundCloud',
    tiktok: 'TikTok',
    x: 'X social media platform',
    youtube: 'YouTube',
  }[socialNetwork];

  const [theme] = useTheme();

  const baseStyle = css`
    display: inline-block;
    height: ${theme.height.h24};
    border-radius: ${theme.radius.r8};
    margin-left: ${theme.margin.m12};
    color: ${theme.color.text.inverted};
    transition: color 0.2s ease-out;

    @media screen and (min-width: ${theme.breakpoints.tablet}px) {
      margin-left: ${theme.margin.m24};
    }

    &:visited,
    &:active {
      color: ${theme.color.text.inverted};
    }

    &:focus-visible {
      outline: none;
      box-shadow: ${theme.boxShadow.focus};
    }

    &:hover {
      color: ${theme.color.neutral.grey20};
    }
  `;

  const style = cx(NAME, baseStyle, className);

  const SocialIcon = {
    facebook: Icon.Facebook,
    flickr: Icon.Flickr,
    instagram: Icon.Instagram,
    soundcloud: Icon.Soundcloud,
    tiktok: Icon.Tiktok,
    x: Icon.XSocial,
    youtube: Icon.Youtube,
  }[socialNetwork];

  return (
    <Link
      href={href}
      target='_blank'
      aria-label={title}
      className={style}
      data-testid={testId}
      {...props}
    >
      <SocialIcon
        aria-hidden='true'
        size={24}
        title={title}
      />
    </Link>
  );
};

export default memo(SocialLink);
