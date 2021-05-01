import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { IconBase } from './base/icon-base';
import { IconProps } from './base/icon-types';

export function SearchIcon(props: IconProps) {
  return <IconBase icon={faSearch} {...props} />;
}
