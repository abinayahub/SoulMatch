const fs = require('fs');
const file = 'artifacts/soulmatch/src/pages/profile-user.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\\n');

const handlers = `      { data: { toUserId: parseInt(userId) } },
      {
        onSuccess: () => { 
          setInterestSent(true); 
          toast({ title: "Interest sent!" }); 
        },
        onError: (err: any) =>
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          }),
      },
    );
  }

  function handleAcceptInterest() {
    respondInterest.mutate(
      { data: { fromUserId: parseInt(userId), action: "accept" } },
      {
        onSuccess: () => {
          toast({ title: "Match created!" });
          navigate(\`/chat/\${userId}\`);
        },
        onError: (err: any) =>
          toast({ title: "Error", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleRejectInterest() {
    respondInterest.mutate(
      { data: { fromUserId: parseInt(userId), action: "reject" } },
      {
        onSuccess: () => {
          toast({ title: "Interest declined" });
          navigate(-1 as any);
        },
        onError: (err: any) =>
          toast({ title: "Error", description: err.message, variant: "destructive" }),
      }
    );
  }

  function handleReport() {
    report.mutate(
      { data: { reportedUserId: parseInt(userId), reason: "other", description: "Reported from profile page" } },`;

let newLines = [];
let replacing = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('// MISSING LINE 101')) {
    newLines.push(handlers);
    replacing = true;
  }
  if (replacing && lines[i].startsWith('// MISSING LINE')) {
     continue;
  } else {
     replacing = false;
     if (!lines[i].startsWith('// MISSING LINE 101')) {
        newLines.push(lines[i]);
     }
  }
}

fs.writeFileSync(file, newLines.join('\\n'));
console.log('Filled missing lines');
