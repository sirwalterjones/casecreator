#!/bin/bash

# Script to fix and protect PDFGenerator.tsx from corruption

echo "🔧 Fixing PDFGenerator.tsx..."

# Restore the file from the working commit
git checkout 2082a01 -- src/components/PDFGenerator.tsx

# Check if the file was restored correctly
if [ $? -eq 0 ]; then
    echo "✅ PDFGenerator.tsx restored from working commit 2082a01"
else
    echo "❌ Failed to restore PDFGenerator.tsx"
    exit 1
fi

# Verify the file ends correctly
if tail -1 src/components/PDFGenerator.tsx | grep -q "export default PDFGenerator;"; then
    echo "✅ File ending verified correctly"
else
    echo "⚠️  File ending looks suspicious"
fi

# Check file size
LINES=$(wc -l < src/components/PDFGenerator.tsx)
echo "📄 File has $LINES lines"

if [ "$LINES" -eq 1160 ]; then
    echo "✅ File line count matches expected (1160 lines)"
else
    echo "⚠️  File line count is unexpected. Expected 1160, got $LINES"
fi

echo "🎉 PDFGenerator.tsx has been fixed!"
echo ""
echo "To prevent future corruption:"
echo "1. Use 'npm run format:fix' to safely format the file"
echo "2. Disable auto-format on save in your editor for this file"
echo "3. Run this script if the file gets corrupted again"