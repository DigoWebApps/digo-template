import { DigoAsset } from '@digo-org/digo-api';

export class Asset extends DigoAsset {
  constructor() {
    super();
  }

  override render() {
    return (
      <div className="flex size-full flex-col items-center justify-center bg-black p-10 text-white">
        DIGO ASSET
      </div>
    );
  }
}
