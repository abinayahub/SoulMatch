const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\91638\\Downloads\\Soul-Match-AI\\Soul-Match-AI\\artifacts\\soulmatch\\src\\components\\profile';
const files = ['ProfessionalDetailsForm.tsx', 'LocationForm.tsx', 'LifestyleForm.tsx', 'PreferencesForm.tsx', 'VerificationForm.tsx'];

files.forEach(file => {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace signature
  content = content.replace(
    /export function (\w+)\(\{\s*p,\s*onSave,\s*onCancel,\s*isPending\s*\}\s*:\s*any\)\s*\{/,
    'export function $1({ p, onSave, onCancel, hasPrevious, isPending }: any) {'
  );

  // Replace button
  content = content.replace(
    /<div className="pt-6">\s*<Button (type="submit" )?disabled={isPending} className="([^"]+)">\s*\{isPending \? "Saving..." : "Continue"\}\s*<\/Button>\s*<\/div>/,
    `<div className="pt-6 flex gap-3">
          {hasPrevious && (
            <Button type="button" variant="outline" onClick={onCancel} className="w-1/3 h-14 text-lg font-bold rounded-xl border-white/20 hover:bg-white/10">
              Previous
            </Button>
          )}
          <Button $1disabled={isPending} className="flex-1 h-14 text-lg font-bold bg-primary text-primary-foreground shadow-md text-white border-0 rounded-xl">
            {isPending ? "Saving..." : "Next"}
          </Button>
        </div>`
  );

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Updated ' + file);
});
