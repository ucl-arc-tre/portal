import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { css } from '@emotion/css';
import SpinnerSvg from '../Spinner';

describe('SpinnerSvg', () => {
  // Snapshot tests

  test('snapshot: default props', () => {
    const renderResult = render(<SpinnerSvg />);
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: custom size', () => {
    const renderResult = render(<SpinnerSvg size={32} />);
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: custom className', () => {
    const style = css`
      color: #0d68cf;
    `;
    const renderResult = render(<SpinnerSvg className={style} />);
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  // Interaction tests

  test('Can be found with default testId', () => {
    const defaultTestId = 'ucl-uikit-spinner';
    const { getByTestId } = render(<SpinnerSvg testId={defaultTestId} />);
    const svg = getByTestId(defaultTestId);
    expect(svg).toBeDefined();
  });

  test('test ID: custom', () => {
    const { getByTestId } = render(<SpinnerSvg testId='custom-test-id' />);
    const svg = getByTestId('custom-test-id');
    expect(svg).toBeDefined();
  });
});
