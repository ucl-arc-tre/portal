import { memo, SVGAttributes, SVGProps } from 'react';
import { css, cx } from '@emotion/css';

export const NAME = 'ucl-icon';

interface ITitledSvgProps<T> extends SVGProps<T> {
  title?: string;
}

export interface BaseIconProps extends SVGAttributes<SVGElement> {
  svg: React.FC<ITitledSvgProps<SVGSVGElement>>;
  size?: number;
  title?: string;
  testId?: string;
}

const BaseIcon = ({
  svg,
  size = 24,
  title,
  width,
  height,
  testId = NAME,
  className,
  ...props
}: BaseIconProps) => {
  const baseStyle = css`
    vertical-align: middle;
  `;

  const style = cx(NAME, baseStyle, className);

  const Svg = svg;

  return (
    <Svg
      width={width || size}
      height={height || size}
      title={title}
      data-testid={testId}
      className={style}
      {...props}
    />
  );
};

export default memo(BaseIcon);
