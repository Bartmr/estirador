import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { IconBase } from './base/icon-base';
import { IconProps } from './base/icon-types';

export function FolderIcon(props: IconProps) {
  return <IconBase icon={faFolder} {...props} />;
}
