---
last-updated:
tags:
type: daily-note
---


# Edits

```dataviewjs
const currentDateStr = dv.current().file.name;

const pages = dv.pages()
  .where(p => {
    const lastUpdated = p["last-updated"];
    if (!lastUpdated) return false;
    const dateObj = dv.luxon.DateTime.fromFormat(lastUpdated, 'yyyy-MM-dd HH:mm');
    if (!dateObj.isValid) return false;
    return dateObj.toFormat("yyyy-MM-dd") === currentDateStr;
  })
  .sort(p => p["last-updated"], "desc");

dv.table(
  ["Note", "Last Updated"],
  pages.map(p => [p.file.link, p["last-updated"]])
);
```

# End