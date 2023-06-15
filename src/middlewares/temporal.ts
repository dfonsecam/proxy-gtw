// write a function to remove duplicates from an array using reduce
function removeDuplicates(arr) {
  return arr.reduce(function (acc, curr) {
    if (!acc.includes(curr)) {
      acc.push(curr);
    }
    return acc;
  }, []);
}

// call the function
console.log(
  removeDuplicates([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]),
);
