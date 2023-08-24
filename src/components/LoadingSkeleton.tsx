import { type ClassNameList } from 'src/contexts/settingContext';
import Panel from './panel/Panel';
import { classNamesTailwind } from 'src/utils/helpers';

const LoadingSkeleton = ({ classNames }: { classNames?: ClassNameList }) => {
    const { skeleton } = classNames ?? {};

    return (
        <div
            className={classNamesTailwind(
                'w-full relative z-0 h-[60vh] min-h-[25rem] md:h-screen bg-black/10 animate-pulse',
                skeleton?.map
            )}
        >
            <div className={classNamesTailwind(skeleton?.panel)}>
                <Panel>
                    <div className={classNamesTailwind('p-4', skeleton?.panelHeading)}></div>
                    <Panel.Body>
                        <div className={classNamesTailwind('overflow-y-auto divide-y', skeleton?.panelBody)}>
                            {Array(16)
                                .fill({})
                                .map((element, index) => (
                                    <div className={classNamesTailwind('p-4 mb-4', skeleton?.listItem)} key={index}></div>
                                ))}
                        </div>
                    </Panel.Body>
                </Panel>
            </div>
        </div>
    );
};

export default LoadingSkeleton;
