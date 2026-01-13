import React, { useEffect, useState } from 'react';
import { Copy, Edit, FolderOpen, History, Receipt, Save, Trash2, UserPlus, Utensils, X } from 'lucide-react';
import headerBg from '../assets/header_bg.png';

const DEFAULT_MEMBERS = ['꾸기', '그니', '라라', '라니', '뿌뿌', '쏘', '쮸', '유니', '하기', '행자', '후니'];
const STORAGE_KEY = 'billSplitter_saves';

const SwimTeamBillSplitter = () => {
    const [rounds, setRounds] = useState([]);
    const [members, setMembers] = useState(DEFAULT_MEMBERS);
    const [pageTitle, setPageTitle] = useState('유등 정산타임');

    const [roundName, setRoundName] = useState('');
    const [roundCost, setRoundCost] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [newMemberName, setNewMemberName] = useState('');
    const [isManageMode, setIsManageMode] = useState(false);

    const [isLoadMode, setIsLoadMode] = useState(false);
    const [savedFiles, setSavedFiles] = useState([]);

    const [editingRoundId, setEditingRoundId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', cost: '', members: [] });

    useEffect(() => {
        if (isLoadMode) {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    setSavedFiles(JSON.parse(saved));
                } catch {
                    setSavedFiles([]);
                }
            } else {
                setSavedFiles([]);
            }
        }
    }, [isLoadMode]);

    const toggleMemberSelection = (member) => {
        if (selectedMembers.includes(member)) {
            setSelectedMembers(selectedMembers.filter((m) => m !== member));
        } else {
            setSelectedMembers([...selectedMembers, member]);
        }
    };

    const selectAll = () => setSelectedMembers(members);
    const deselectAll = () => setSelectedMembers([]);

    const addRound = (e) => {
        e.preventDefault();
        if (!roundName.trim() || !roundCost || selectedMembers.length === 0) return;

        const newRound = {
            id: Date.now(),
            name: roundName,
            cost: parseFloat(roundCost),
            members: selectedMembers,
        };

        setRounds([...rounds, newRound]);
        setRoundName('');
        setRoundCost('');
        setSelectedMembers([]);
    };

    const removeRound = (id) => {
        setRounds(rounds.filter((r) => r.id !== id));
    };

    const calculateTotals = () => {
        const totals = {};
        members.forEach((m) => {
            totals[m] = 0;
        });

        rounds.forEach((round) => {
            const splitAmount = round.cost / round.members.length;
            round.members.forEach((member) => {
                if (totals[member] !== undefined) {
                    totals[member] += splitAmount;
                }
            });
        });

        return totals;
    };

    const memberTotals = calculateTotals();
    const totalCollected = Object.values(memberTotals).reduce((a, b) => a + b, 0);

    const addMember = (e) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;
        if (members.includes(newMemberName.trim())) {
            alert('이미 존재하는 회원입니다.');
            return;
        }
        setMembers([...members, newMemberName.trim()]);
        setNewMemberName('');
    };

    const removeMember = (memberToRemove) => {
        const isInvolved = rounds.some((r) => r.members.includes(memberToRemove));
        if (isInvolved) {
            alert('정산에 참여한 회원은 삭제할 수 없어요. 해당 회차에서 멤버를 제거해 주세요.');
            return;
        }
        setMembers(members.filter((m) => m !== memberToRemove));
        setSelectedMembers((prev) => prev.filter((m) => m !== memberToRemove));
    };

    const startEditRound = (round) => {
        setEditingRoundId(round.id);
        setEditForm({
            name: round.name,
            cost: round.cost.toString(),
            members: [...round.members],
        });
    };

    const cancelEdit = () => {
        setEditingRoundId(null);
        setEditForm({ name: '', cost: '', members: [] });
    };

    const saveEdit = (roundId) => {
        if (!editForm.name.trim() || !editForm.cost || editForm.members.length === 0) {
            alert('모든 항목을 입력해 주세요.');
            return;
        }

        const updatedRounds = rounds.map((r) => {
            if (r.id === roundId) {
                return {
                    ...r,
                    name: editForm.name,
                    cost: parseFloat(editForm.cost),
                    members: editForm.members,
                };
            }
            return r;
        });

        setRounds(updatedRounds);
        cancelEdit();
    };

    const toggleEditMember = (member) => {
        if (editForm.members.includes(member)) {
            setEditForm({
                ...editForm,
                members: editForm.members.filter((m) => m !== member),
            });
        } else {
            setEditForm({
                ...editForm,
                members: [...editForm.members, member],
            });
        }
    };

    const saveToStorage = () => {
        if (rounds.length === 0) {
            alert('저장할 기록이 없습니다.');
            return;
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
        const saveName = `${dateStr}_${timeStr}_${rounds.length}회차`;

        const newSave = {
            id: Date.now(),
            name: saveName,
            timestamp: now.toISOString(),
            data: {
                title: pageTitle,
                members,
                rounds,
            },
        };

        const existing = localStorage.getItem(STORAGE_KEY);
        const saves = existing ? JSON.parse(existing) : [];
        const updatedSaves = [newSave, ...saves];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaves));
        setSavedFiles(updatedSaves);
        alert(`저장되었습니다: ${saveName}`);
    };

    const generateResultText = () => {
        const fmt = (n) => Math.round(n).toLocaleString();

        const roundDetails = rounds
            .map((r) => {
                const perPerson = r.cost / r.members.length;
                return `${r.name}
참석: ${r.members.join(', ')} (${r.members.length}명)
총액 ${fmt(r.cost)}원 ÷ ${r.members.length}명 = ${fmt(perPerson)}원`;
            })
            .join('\n\n');

        const memberDetails = members
            .filter((m) => memberTotals[m] > 0)
            .map((m) => {
                const attendedRounds = rounds.filter((r) => r.members.includes(m));
                const calcString = attendedRounds
                    .map((r) => {
                        const amount = r.cost / r.members.length;
                        return `${r.name} ${fmt(amount)}원`;
                    })
                    .join(' + ');

                return `${m}
${calcString} = ${fmt(memberTotals[m])}원`;
            })
            .join('\n\n');

        return `🏊 ${pageTitle} 🧾
총 ${rounds.length}회차 기록

🍣 회차별 정산 내역
--------------------

${roundDetails}

모두 낸 금액 합계: ${totalCollected.toLocaleString()}원


👥 멤버별 정산 금액
--------------------

${memberDetails}



회식 비용을 확인하시고 입금 부탁드려요. 🙏`;
    };

    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState('');

    const handleOpenPreview = () => {
        if (!showPreview) {
            const text = generateResultText();
            setPreviewContent(text);
        }
        setShowPreview(!showPreview);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(previewContent);
        alert('정산 내용이 복사되었습니다.');
    };

    const loadFromStorage = (saveItem) => {
        if (!window.confirm('현재 작업 중인 내용 위에 불러옵니다. 불러올까요?')) return;

        const { title, members: savedMembers, rounds: savedRounds } = saveItem.data;
        if (savedMembers) setMembers(savedMembers);
        if (savedRounds) setRounds(savedRounds);
        if (title) setPageTitle(title);

        setIsLoadMode(false);
    };

    const deleteSave = (id) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        const updated = savedFiles.filter((s) => s.id !== id);
        setSavedFiles(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    return (
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden font-sans border border-white/20 ring-1 ring-black/5">
            <div
                className="relative bg-[#FDACAC] text-white h-32 transition-all"
                style={{
                    backgroundImage: `url(${headerBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-[#FDACAC]/90 mix-blend-multiply" />
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-4xl font-black flex items-center gap-3 drop-shadow-md tracking-tight text-white">
                                <Utensils className="h-8 w-8 text-white drop-shadow-sm" />
                                <span className="text-white drop-shadow-md">{pageTitle}</span>
                            </h2>
                            <p className="text-white/90 mt-2 font-bold text-lg drop-shadow-md">총무야 내가 도와줄게!</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-8">
                <div className="flex justify-end">
                    <button
                        onClick={() => setIsManageMode(!isManageMode)}
                        className="text-sm font-bold text-[#FF8B8D] hover:text-[#FF7173] transition-colors flex items-center gap-1 py-2"
                    >
                        {isManageMode ? '관리 닫기' : '🙋‍♂️ 팀원 관리 열기'}
                    </button>
                </div>

                {isManageMode && (
                    <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            회원 관리 / 멤버 {members.length}명
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {members.map((m) => (
                                <div key={m} className="bg-white px-3 py-1 rounded-full border border-gray-200 text-sm flex items-center gap-2 shadow-sm">
                                    {m}
                                    <button onClick={() => removeMember(m)} className="text-gray-400 hover:text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={addMember} className="flex gap-2">
                            <input
                                type="text"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="팀원 이름"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm"
                            />
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 whitespace-nowrap">
                                추가
                            </button>
                        </form>
                    </section>
                )}

                <section className="space-y-4 border-b pb-6 border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        새로운 회차 입력
                        <span className="text-sm font-normal text-gray-400 ml-1">(무한대로 추가 가능)</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1.5 ml-1">회차명</label>
                            <input
                                type="text"
                                value={roundName}
                                onChange={(e) => setRoundName(e.target.value)}
                                placeholder="예) 1차 회식"
                                className="w-full px-5 py-3 bg-[#FFECC7]/40 border-0 rounded-2xl focus:ring-2 focus:ring-[#FFACAD] focus:bg-white transition-all outline-none font-medium placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1.5 ml-1">결제 금액</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="100"
                                    value={roundCost}
                                    onChange={(e) => setRoundCost(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-5 py-3 bg-[#FFECC7]/40 border-0 rounded-2xl focus:ring-2 focus:ring-[#FFACAD] focus:bg-white transition-all outline-none text-right pr-10 font-bold text-gray-800 placeholder:text-gray-300"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">원</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">참석 회원 선택 ({selectedMembers.length}명)</label>
                            <div className="space-x-2 text-sm">
                                <button type="button" onClick={selectAll} className="text-blue-600 hover:text-blue-800 font-medium">
                                    전체 선택
                                </button>
                                <span className="text-gray-300">|</span>
                                <button type="button" onClick={deselectAll} className="text-gray-500 hover:text-gray-700">
                                    전체 해제
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {members.map((member) => (
                                <button
                                    key={member}
                                    type="button"
                                    onClick={() => toggleMemberSelection(member)}
                                    className={`px-3 py-2 rounded-xl text-sm transition-all font-bold shadow-sm active:scale-95 ${selectedMembers.includes(member)
                                        ? 'bg-[#FFACAD] text-white shadow-[#FFACAD]/30 ring-0 transform -translate-y-0.5'
                                        : 'bg-white border border-gray-100 text-gray-400 hover:bg-[#FFECC7]/30 hover:text-gray-600'
                                        }`}
                                >
                                    {member}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={addRound}
                        disabled={!roundName || !roundCost || selectedMembers.length === 0}
                        className="w-full py-4 bg-[#FDACAC] text-white rounded-2xl font-bold text-lg hover:bg-[#FF8B8D] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-[#FDACAC]/20 active:scale-[0.99]"
                    >
                        정산 목록에 추가하기
                    </button>
                </section>

                {rounds.length > 0 && (
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-800">진행한 회차 목록</h3>
                        <div className="space-y-3">
                            {rounds.map((round) => (
                                <div key={round.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                    {editingRoundId === round.id ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-600 mb-1.5 ml-1">회차명</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="w-full px-5 py-3 bg-[#FFECC7]/40 border-0 rounded-2xl focus:ring-2 focus:ring-[#FFACAD] focus:bg-white transition-all outline-none font-medium"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-600 mb-1.5 ml-1">결제 금액</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="100"
                                                            value={editForm.cost}
                                                            onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                                                            className="w-full px-5 py-3 bg-[#FFECC7]/40 border-0 rounded-2xl focus:ring-2 focus:ring-[#FFACAD] focus:bg-white transition-all outline-none text-right pr-10 font-bold text-gray-800"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">원</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">참석 회원 선택 ({editForm.members.length}명)</label>
                                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                    {members.map((member) => (
                                                        <button
                                                            key={member}
                                                            type="button"
                                                            onClick={() => toggleEditMember(member)}
                                                            className={`px-3 py-2 rounded-xl text-sm transition-all font-bold shadow-sm active:scale-95 ${editForm.members.includes(member)
                                                                ? 'bg-[#FFACAD] text-white shadow-[#FFACAD]/30 ring-0 transform -translate-y-0.5'
                                                                : 'bg-white border border-gray-100 text-gray-400 hover:bg-[#FFECC7]/30 hover:text-gray-600'
                                                                }`}
                                                        >
                                                            {member}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button onClick={() => saveEdit(round.id)} className="flex-1 py-3 bg-[#FDACAC] text-white rounded-xl font-bold hover:bg-[#FF8B8D] transition-all">
                                                    저장
                                                </button>
                                                <button onClick={cancelEdit} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-gray-900">{round.name}</div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    <span className="font-semibold text-[#FF8B8D]">{round.cost.toLocaleString()}원</span>
                                                    <span className="mx-2">|</span>
                                                    {round.members.length}명 참석 (1인당 {(round.cost / round.members.length).toLocaleString()}원)
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">{round.members.join(', ')}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEditRound(round)}
                                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => removeRound(round.id)}
                                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="bg-white rounded-3xl border border-gray-200/60 overflow-hidden shadow-2xl shadow-rose-900/5">
                    <div className="bg-[#FDACAC] text-white px-7 py-5 flex justify-between items-center">
                        <div className="flex items-center gap-3 font-bold text-lg">
                            <Receipt className="h-6 w-6 text-[#FFACAD]" />
                            최종 정산 결과
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {members.map((member) => {
                            const amount = memberTotals[member];
                            if (amount === 0) return null;

                            const attendedRounds = rounds.filter((r) => r.members.includes(member));
                            const breakdown = attendedRounds
                                .map((r) => {
                                    const roundAmount = r.cost / r.members.length;
                                    return `${r.name} ${Math.round(roundAmount).toLocaleString()}원`;
                                })
                                .join(' + ');

                            return (
                                <div key={member} className="px-6 py-3 hover:bg-slate-100 transition">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">{member}</span>
                                        <span className="font-bold text-slate-800">{Math.round(amount).toLocaleString()}원</span>
                                    </div>
                                    {breakdown && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {breakdown} = {Math.round(amount).toLocaleString()}원
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="px-6 py-4 bg-[#FDACAC]/10 flex justify-between items-center border-t border-[#FDACAC]/20">
                            <span className="font-bold text-[#b57a7a]">총합</span>
                            <span className="font-bold text-xl text-[#a36666]">{totalCollected.toLocaleString()}원</span>
                        </div>
                    </div>

                    {isLoadMode && (
                        <div className="px-4 pb-4 bg-gray-50 animate-in fade-in slide-in-from-bottom-2">
                            <section className="bg-white p-4 rounded-lg border border-gray-200 space-y-3 shadow-sm">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                                    <History className="h-4 w-4" />
                                    저장된 기록 불러오기
                                </h3>
                                {savedFiles.length === 0 ? (
                                    <p className="text-xs text-gray-500 py-4 text-center">저장된 기록이 없습니다.</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {savedFiles.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-gray-100 hover:border-blue-300 transition group">
                                                <button onClick={() => loadFromStorage(file)} className="flex-1 text-left">
                                                    <div className="font-semibold text-gray-800 text-sm">{file.name}</div>
                                                    <div className="text-[10px] text-gray-500">{new Date(file.timestamp).toLocaleString()}</div>
                                                </button>
                                                <button onClick={() => deleteSave(file.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded transition">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => setIsLoadMode(false)}
                                    className="w-full py-2 text-xs text-gray-500 hover:bg-gray-100 rounded transition border border-gray-200"
                                >
                                    닫기
                                </button>
                            </section>
                        </div>
                    )}

                    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2">
                        <div className="flex gap-2">
                            <button
                                onClick={saveToStorage}
                                className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border-2 border-gray-100 hover:border-[#FF8B8D] hover:bg-[#FF8B8D]/5 text-gray-600 rounded-2xl transition font-bold shadow-sm group"
                            >
                                <Save className="h-5 w-5 group-hover:text-[#FF8B8D] transition-colors" />
                                저장하기
                            </button>
                            <button
                                onClick={() => setIsLoadMode(!isLoadMode)}
                                className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-2xl transition font-bold shadow-sm ${isLoadMode
                                    ? 'bg-[#FFD1D0]/20 border-[#FFD1D0] text-[#8c5a5a]'
                                    : 'bg-white border-gray-100 hover:border-[#FFD1D0]/50 hover:bg-[#FFD1D0]/10 text-gray-600'
                                    }`}
                            >
                                <FolderOpen className="h-5 w-5" />
                                불러오기
                            </button>
                        </div>

                        <button
                            onClick={handleOpenPreview}
                            className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl transition-all font-bold text-lg shadow-lg active:scale-[0.99] ${showPreview ? 'bg-gray-100 text-gray-600 shadow-none' : 'bg-[#FDACAC] hover:bg-[#FF8B8D] text-white shadow-[#FDACAC]/20'
                                }`}
                        >
                            <Copy className="h-5 w-5" />
                            {showPreview ? '미리보기 닫기' : '정산내용 복사 (카톡 공유)'}
                        </button>

                        {showPreview && (
                            <div className="mt-4 border-2 border-[#FDACAC]/20 rounded-2xl overflow-hidden bg-white animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-[#FDACAC]/5 p-3 border-b border-[#FDACAC]/10 flex justify-between items-center">
                                    <span className="text-sm font-bold text-[#FDACAC]">복사 내용 미리보기</span>
                                    <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="p-4 bg-slate-50 max-h-[400px] overflow-auto">
                                    <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-gray-700">{previewContent}</pre>
                                </div>
                                <div className="p-3 bg-white border-t border-gray-100">
                                    <button
                                        onClick={handleCopy}
                                        className="w-full py-3 text-white bg-[#FDACAC] hover:bg-[#FF8B8D] rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        <Copy className="h-5 w-5" />
                                        클립보드로 복사하기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SwimTeamBillSplitter;
