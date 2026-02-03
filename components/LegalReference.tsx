import React from 'react';

const LegalReference: React.FC = () => {
    return (
        <section className="mt-16 border-t border-morandi-oat pt-12 pb-24 no-print">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-morandi-oat flex items-center justify-center text-morandi-brown shadow-inner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
                <h2 className="text-[20px] font-black text-morandi-brown-dark tracking-tight">法律依據 (民法繼承編)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 繼承順位與代位 */}
                <div className="space-y-6">
                    <div className="p-6 bg-white rounded-3xl border border-morandi-oat shadow-sm">
                        <h3 className="text-[16px] font-black text-morandi-brown-dark mb-4 pb-2 border-b border-morandi-oat">繼承人順序與代位</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[14px] font-black text-morandi-rose-dark mb-1">第 1138 條</h4>
                                <p className="text-[14px] text-morandi-brown font-black leading-relaxed opacity-70">
                                    遺產繼承人，除配偶外，依左列順序定之：<br />
                                    一、直系血親卑親屬。<br />
                                    二、父母。<br />
                                    三、兄弟姊妹。<br />
                                    四、祖父母。
                                </p>
                            </div>
                            <div>
                                <h4 className="text-[14px] font-black text-morandi-rose-dark mb-1">第 1139 條</h4>
                                <p className="text-[14px] text-morandi-brown font-black leading-relaxed opacity-70">
                                    前條所定第Ⅰ順序之繼承人，以親等近者為先。
                                </p>
                            </div>
                            <div>
                                <h4 className="text-[14px] font-black text-morandi-rose-dark mb-1">第 1140 條</h4>
                                <p className="text-[14px] text-morandi-brown font-black leading-relaxed opacity-70">
                                    第一千一百三十八條所定第Ⅰ順序之繼承人，有於繼承開始前死亡或喪失繼承權者，由其直系血親卑親屬代位繼承其應繼分。
                                </p>
                            </div>
                            <div>
                                <h4 className="text-[14px] font-black text-morandi-rose-dark mb-1">第 1141 條</h4>
                                <p className="text-[14px] text-morandi-brown font-black leading-relaxed opacity-70">
                                    同一順序之繼承人有數人時，按人數平均繼承。但法律另有規定者，不在此限。
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* 應繼分與拋棄繼承 */}
                <div className="space-y-6">
                    <div className="p-6 bg-white rounded-3xl border border-morandi-oat shadow-sm">
                        <h3 className="text-[16px] font-black text-morandi-brown-dark mb-4 pb-2 border-b border-morandi-oat">應繼分之分配</h3>
                        <div>
                            <h4 className="text-[14px] font-black text-morandi-rose-dark mb-1">第 1144 條</h4>
                            <p className="text-[14px] text-morandi-brown font-black leading-relaxed opacity-70">
                                配偶有相互繼承遺產之權，其應繼分，依左列各款定之：<br />
                                一、與第一千一百三十八條所定第Ⅰ順序之繼承人同為繼承時，其應繼分與他繼承人平均。<br />
                                二、與第一千一百三十八條所定第Ⅱ順序或第Ⅲ順序之繼承人同為繼承時，其應繼分為遺產二分之一。<br />
                                三、與第一千一百三十八條所定第Ⅳ順序之繼承人同為繼承時，其應繼分為遺產三分之二。<br />
                                四、無第一千一百三十八條所定第Ⅰ順序至第Ⅳ順序之繼承人時，其應繼分為遺產全部。
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-[#fdf2f2] rounded-3xl border border-morandi-rose/10 shadow-sm">
                        <h3 className="text-[16px] font-black text-morandi-rose-dark mb-4 pb-2 border-b border-morandi-rose/10">抛棄繼承之法律效果</h3>
                        <div>
                            <h4 className="text-[14px] font-black text-morandi-rose-dark mb-1">第 1176 條</h4>
                            <p className="text-[14px] text-morandi-brown font-black leading-relaxed opacity-70 space-y-2">
                                第一千一百三十八條所定第Ⅰ順序之繼承人中有拋棄繼承權者，其應繼分歸屬於其他同為繼承之人。<br />
                                第Ⅱ順序至第Ⅳ順序之繼承人中，有拋棄繼承權者，其應繼分歸屬於其他同一順序之繼承人。<br />
                                與配偶同為繼承之同一順序繼承人均拋棄繼承權，而無後順序之繼承人時，其應繼分歸屬於配偶。<br />
                                配偶拋棄繼承權者，其應繼分歸屬於與其同為繼承之人。<br />
                                第Ⅰ順序之繼承人，其親等近者均拋棄繼承權時，由次親等之直系血親卑親屬繼承。<br />
                                先順序繼承人均拋棄其繼承權時，由次順序之繼承人繼承。其次順序繼承人有無不明或第Ⅳ順序之繼承人均拋棄其繼承權者，準用關於無人承認繼承之規定。<br />
                                因他人拋棄繼承而應為繼承之人，為拋棄繼承時，應於知悉其得繼承之日起三個月內為之。
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-[14px] text-morandi-brown/40 font-black">
                    ※ 本計算工具僅供參考，實際分配請依中華民國法律規定與法院判決為準。
                </p>
            </div>
        </section>
    );
};

export default LegalReference;
