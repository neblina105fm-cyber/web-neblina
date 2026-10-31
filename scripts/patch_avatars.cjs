const fs = require('fs');

// Patch StaffPortalModal.jsx
let staffCode = fs.readFileSync('src/components/staff/StaffPortalModal.jsx', 'utf8');
if (!staffCode.includes('AvatarWithFallback')) {
  staffCode = staffCode.replace(
    "import SystemInstallButton from '../SystemInstallButton';",
    "import SystemInstallButton from '../SystemInstallButton';\nimport AvatarWithFallback from '../AvatarWithFallback';"
  );
}

// Replace header avatar in StaffPortalModal
const targetHeader = `<div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-[#00DD9E] p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0">
              {currentStaff?.avatar ? (
                <img
                  src={currentStaff.avatar}
                  alt={currentStaff.name}
                  className="w-full h-full object-cover rounded-[14px]"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full bg-[#001E4D] rounded-[14px] flex items-center justify-center text-white">
                  <Mic className="w-5 h-5 text-[#00DD9E]" />
                </div>
              )}
            </div>`;

const replaceHeader = `<AvatarWithFallback
              src={currentStaff?.avatar}
              alt={currentStaff?.name || 'Locutor'}
              containerClassName="w-10 h-10 rounded-2xl bg-[#001E4D] border-2 border-[#00DD9E] p-0.5 shadow-none flex items-center justify-center overflow-hidden shrink-0"
              iconClassName="w-5 h-5 text-[#00DD9E]"
            />`;

if (staffCode.includes(targetHeader)) {
  staffCode = staffCode.replace(targetHeader, replaceHeader);
}

// Replace sidebar profile avatar in StaffPortalModal
const targetSidebar = `<div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                      {currentStaff?.avatar ? (
                        <img
                          src={currentStaff.avatar}
                          alt={currentStaff?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <User className="w-6 h-6 text-[#00DD9E]" />
                      )}
                    </div>`;

const replaceSidebar = `<AvatarWithFallback
                      src={currentStaff?.avatar}
                      alt={currentStaff?.name || 'Locutor'}
                      containerClassName="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden"
                      iconClassName="w-6 h-6 text-[#00DD9E]"
                    />`;

if (staffCode.includes(targetSidebar)) {
  staffCode = staffCode.replace(targetSidebar, replaceSidebar);
}

// Replace mobile drawer avatar in StaffPortalModal
const targetMobileDrawer = `<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden">
                          {currentStaff?.avatar ? (
                            <img
                              src={currentStaff.avatar}
                              alt={currentStaff?.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <User className="w-5 h-5 text-[#00DD9E]" />
                          )}
                        </div>`;

const replaceMobileDrawer = `<AvatarWithFallback
                          src={currentStaff?.avatar}
                          alt={currentStaff?.name || 'Locutor'}
                          containerClassName="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden"
                          iconClassName="w-5 h-5 text-[#00DD9E]"
                        />`;

if (staffCode.includes(targetMobileDrawer)) {
  staffCode = staffCode.replace(targetMobileDrawer, replaceMobileDrawer);
}

fs.writeFileSync('src/components/staff/StaffPortalModal.jsx', staffCode, 'utf8');

// Patch AdminStaffPortalManager.jsx
let adminStaffCode = fs.readFileSync('src/components/admin/AdminStaffPortalManager.jsx', 'utf8');
if (!adminStaffCode.includes('AvatarWithFallback')) {
  adminStaffCode = adminStaffCode.replace(
    "import React, { useState, useEffect, useRef } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport AvatarWithFallback from '../AvatarWithFallback';"
  );
}

const targetAdminStaffCard = `<div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-slate-200 dark:border-white/10 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                        {staff.avatar ? (
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <User className="w-6 h-6 text-[#00DD9E]" />
                        )}
                      </div>`;

const replaceAdminStaffCard = `<AvatarWithFallback
                        src={staff.avatar}
                        alt={staff.name}
                        containerClassName="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-center overflow-hidden"
                        iconClassName="w-6 h-6 text-[#00DD9E]"
                      />`;

if (adminStaffCode.includes(targetAdminStaffCard)) {
  adminStaffCode = adminStaffCode.replace(targetAdminStaffCard, replaceAdminStaffCard);
}

const targetAdminStaffCred = `<div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-slate-200 dark:border-white/10 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                        {staff.avatar ? (
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <User className="w-5 h-5 text-[#00DD9E]" />
                        )}
                      </div>`;

const replaceAdminStaffCred = `<AvatarWithFallback
                        src={staff.avatar}
                        alt={staff.name}
                        containerClassName="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-center overflow-hidden"
                        iconClassName="w-5 h-5 text-[#00DD9E]"
                      />`;

if (adminStaffCode.includes(targetAdminStaffCred)) {
  adminStaffCode = adminStaffCode.replace(targetAdminStaffCred, replaceAdminStaffCred);
}

fs.writeFileSync('src/components/admin/AdminStaffPortalManager.jsx', adminStaffCode, 'utf8');

// Patch JournalistPortalModal.jsx
let journalistCode = fs.readFileSync('src/components/journalists/JournalistPortalModal.jsx', 'utf8');
if (!journalistCode.includes('AvatarWithFallback')) {
  journalistCode = journalistCode.replace(
    "import SystemInstallButton from '../SystemInstallButton';",
    "import SystemInstallButton from '../SystemInstallButton';\nimport AvatarWithFallback from '../AvatarWithFallback';"
  );
}

const targetJournalistSidebar = `<div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                      {session?.avatar ? (
                        <img
                          src={session.avatar}
                          alt={session?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <User className="w-6 h-6 text-[#00DD9E]" />
                      )}
                    </div>`;

const replaceJournalistSidebar = `<AvatarWithFallback
                      src={session?.avatar}
                      alt={session?.name || 'Periodista'}
                      containerClassName="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden"
                      iconClassName="w-6 h-6 text-[#00DD9E]"
                    />`;

if (journalistCode.includes(targetJournalistSidebar)) {
  journalistCode = journalistCode.replace(targetJournalistSidebar, replaceJournalistSidebar);
}

const targetJournalistMobile = `<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden">
                          {session?.avatar ? (
                            <img
                              src={session.avatar}
                              alt={session?.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <User className="w-5 h-5 text-[#00DD9E]" />
                          )}
                        </div>`;

const replaceJournalistMobile = `<AvatarWithFallback
                          src={session?.avatar}
                          alt={session?.name || 'Periodista'}
                          containerClassName="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden"
                          iconClassName="w-5 h-5 text-[#00DD9E]"
                        />`;

if (journalistCode.includes(targetJournalistMobile)) {
  journalistCode = journalistCode.replace(targetJournalistMobile, replaceJournalistMobile);
}

fs.writeFileSync('src/components/journalists/JournalistPortalModal.jsx', journalistCode, 'utf8');

// Patch AdminJournalistsTab.jsx
let adminJournalistsCode = fs.readFileSync('src/components/admin/AdminJournalistsTab.jsx', 'utf8');
if (!adminJournalistsCode.includes('AvatarWithFallback')) {
  adminJournalistsCode = adminJournalistsCode.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport AvatarWithFallback from '../AvatarWithFallback';"
  );
}

const targetAdminJournalistCard = `<div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {j.avatar ? (
                    <img
                      src={j.avatar}
                      alt={j.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <User className="w-6 h-6 text-[#00DD9E]" />
                  )}
                </div>`;

const replaceAdminJournalistCard = `<AvatarWithFallback
                    src={j.avatar}
                    alt={j.name}
                    containerClassName="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden"
                    iconClassName="w-6 h-6 text-[#00DD9E]"
                  />`;

if (adminJournalistsCode.includes(targetAdminJournalistCard)) {
  adminJournalistsCode = adminJournalistsCode.replace(targetAdminJournalistCard, replaceAdminJournalistCard);
}

fs.writeFileSync('src/components/admin/AdminJournalistsTab.jsx', adminJournalistsCode, 'utf8');

console.log('All portals updated with AvatarWithFallback successfully!');
