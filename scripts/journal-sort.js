Hooks.on("ready", function() {
    oldPopulate = SidebarDirectory._populate
    
    // Function to sort two strings that may contain numbers.
    // Will treat the numbers inside the strings like numbers, 
    // and the rest of the strings like strings.
    sortWithNumbers = function(a, b) {
        aLen = a.length
        bLen = b.length
        ai = 0
        bi = 0

        isCharDigit = function(x) { return x >= '0' && x <= '9' }

        for ( ; ai < aLen && bi < bLen ; ++ai, ++bi)
        {
            ac = a.charAt(ai)
            bc = b.charAt(bi)
            if (isCharDigit(ac) && isCharDigit(bc))
            {
                // Strings were same to this point, now inside a number. Find the end of the number for each
                aj = ai+1
                while (aj < aLen)
                {
                    if (!isCharDigit(a.charAt(aj)))
                    {
                        break
                    }
                    ++aj
                }

                bj = bi+1
                while (bj < bLen)
                {
                    if (!isCharDigit(b.charAt(bj)))
                    {
                        break
                    }
                    ++bj
                }

                an = Number.parseInt(a.substring(ai, aj))
                bn = Number.parseInt(b.substring(bi, bj))

                if (an != bn)
                {
                    // Numbers are different, return numeric sorting
                    return an - bn
                }

                // Numbers are the same, move on
                ai = aj-1
                bi = bj-1
            }
            else
            {
                
                if (ac != bc)
                {
                    // We're not in a number and hit a difference, regular string sort from here out
                    return a.substring(ai).localeCompare(b.substring(bi))
                }
                // else loop, the strings are the same and there might be more numbers later!
            }
        }

        // Basically equivalent, whichever is shorter goes first
        if (aLen < bLen)
        {
            return -1
        }
        else if (bLen < aLen)
        {
            return 1;
        }

        // Almost entirely equivalent. Could still be the same like 001 vs. 1 or something. Do a regular string compare.
        return a.localeCompare(b)
    }

    // NOTE: This is the function as defined here:
    //   https://foundryvtt.com/api/foundry.js.html
    // for FoundryVTT 0.7.9
    SidebarDirectory._populate = function(folder, folders, entities, {allowChildren=true}={}) {
        const id = folder._id;
        // Define sorting function for this folder
        const alpha = folder.data?.sorting === "a";
        // ** BEGIN CHANGES **
//      const s = alpha ? (a, b) => a.name.localeCompare(b.name) : (a, b) => a.data.sort - b.data.sort;
        const s = alpha ? (a, b) => sortWithNumbers(a.name, b.name) : (a, b) => a.data.sort - b.data.sort;
        // ** END CHANGES **
        // Partition folders into children and unassigned folders
        let [u, children] = folders.partition(f => allowChildren && (f.data.parent === id));
        folder.children = children.sort(s);
        folders = u;
        // Partition entities into contents and unassigned entities
        const [e, content] = entities.partition(e => e.data.folder === id);
        folder.content = content.sort(s);
        entities = e;
        // Return the remainder
        return [folders, entities];
    }
});