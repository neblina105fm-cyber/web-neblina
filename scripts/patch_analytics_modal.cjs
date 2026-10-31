const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminAnalyticsTab.jsx', 'utf8');

// The modal container currently is:
// <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
// <div className="w-full max-w-xl bg-white dark:bg-[#001E4D] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#00DD9E]/30 flex flex-col text-xs">
//
// We want it to be perfectly visible without scrolling the outer page:
// overflow-y-auto on the backdrop:
// <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
//   <div className="w-full max-w-xl max-h-[92vh] my-auto bg-white dark:bg-[#001E4D] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#00DD9E]/30 flex flex-col text-xs">
// And ensure its form has max-h-[calc(92vh-130px)] overflow-y-auto

const oldModalStart = '<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">\n          <div className="w-full max-w-xl bg-white dark:bg-[#001E4D] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#00DD9E]/30 flex flex-col text-xs">';
const oldModalAlt = '<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">\r\n          <div className="w-full max-w-xl bg-white dark:bg-[#001E4D] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#00DD9E]/30 flex flex-col text-xs">';

const newModalStart = `<div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-xl max-h-[92vh] my-auto bg-white dark:bg-[#001438] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#00DD9E]/40 flex flex-col text-xs">`;

if (code.includes(oldModalStart)) {
  code = code.replace(oldModalStart, newModalStart);
  console.log('Updated API modal container (LF)');
} else if (code.includes(oldModalAlt)) {
  code = code.replace(oldModalAlt, newModalStart);
  console.log('Updated API modal container (CRLF)');
} else {
  console.log('Could not match exact old modal start, searching flexible pattern');
  const target = 'isConfigModalOpen && editingConnector && (\n        <div className="fixed inset-0 z-50';
  const altTarget = 'isConfigModalOpen && editingConnector && (\r\n        <div className="fixed inset-0 z-50';
  if (code.includes('isConfigModalOpen && editingConnector && (')) {
    const idx = code.indexOf('isConfigModalOpen && editingConnector && (');
    const startDiv = code.indexOf('<div className="fixed inset-0', idx);
    const innerDiv = code.indexOf('<div className="w-full max-w-xl', startDiv);
    const endInnerDiv = code.indexOf('flex flex-col text-xs">', innerDiv) + 'flex flex-col text-xs">'.length;
    code = code.substring(0, startDiv) + newModalStart + code.substring(endInnerDiv);
    console.log('Replaced API modal container with flexible pattern');
  }
}

fs.writeFileSync('src/components/admin/AdminAnalyticsTab.jsx', code, 'utf8');
console.log('AdminAnalyticsTab.jsx updated successfully.');
