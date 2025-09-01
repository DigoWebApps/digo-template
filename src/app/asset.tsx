import { DigoAsset } from '@digo-org/digo-api';

export class Asset extends DigoAsset {
  constructor() {
    super();
  }

  override render() {
    return (
      <div className="flex size-full flex-col items-center gap-10 bg-green-500 p-10">

        {this.instances?.map((instance, index) => {
          const color = instance['bar-color'];
          return <div key={`cell-${index}`} className="size-10 border border-black" style={{ backgroundColor: color as string }} />;
        })}
      </div>
    );
  }
}
