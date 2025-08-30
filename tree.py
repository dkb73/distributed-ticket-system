import os
import argparse
from pathlib import Path

# Default directories and files to exclude
DEFAULT_EXCLUDE_DIRS = {
    'node_modules', '__pycache__', '.git', 'venv', '.venv',
    '.vscode', '.idea', 'dist', 'build'
}
DEFAULT_EXCLUDE_FILES = {'.DS_Store'}

def generate_tree(directory: Path, prefix: str = "", exclude_dirs: set = None, exclude_files: set = None):
    """
    A recursive generator that yields the directory structure line by line,
    and finally a tuple with the counts of directories and files.
    """
    if exclude_dirs is None:
        exclude_dirs = DEFAULT_EXCLUDE_DIRS
    if exclude_files is None:
        exclude_files = DEFAULT_EXCLUDE_FILES

    try:
        items = [
            item for item in directory.iterdir()
            if item.name not in (exclude_dirs if item.is_dir() else exclude_files)
        ]
        items.sort(key=lambda x: (not x.is_dir(), x.name.lower()))
    except PermissionError:
        yield f"{prefix}└── [Error: Permission Denied]"
        yield (None, 0, 0)  # Yield zero counts on error
        return

    pointers = ['├── '] * (len(items) - 1) + ['└── ']
    
    dir_count, file_count = 0, 0

    for pointer, item in zip(pointers, items):
        yield prefix + pointer + item.name
        
        if item.is_dir():
            dir_count += 1
            extension = '│   ' if pointer == '├── ' else '    '
            
            # --- START OF FIX ---
            # The previous code tried to unpack every yielded item, which was incorrect.
            # This new code iterates through the sub-generator and correctly handles
            # both strings (tree lines) and the final count tuple.
            sub_generator = generate_tree(
                item,
                prefix=prefix + extension,
                exclude_dirs=exclude_dirs,
                exclude_files=exclude_files
            )
            for sub_item in sub_generator:
                if isinstance(sub_item, tuple) and sub_item[0] is None:
                    # This is the count tuple from the recursion
                    _, sub_d_count, sub_f_count = sub_item
                    dir_count += sub_d_count
                    file_count += sub_f_count
                else:
                    # This is a string line, so we yield it up
                    yield sub_item
            # --- END OF FIX ---
            
        else:
            file_count += 1
    
    yield (None, dir_count, file_count)


def main():
    """Main function to parse arguments and run the tree generator."""
    parser = argparse.ArgumentParser(
        description="Generate a directory structure tree for a project, excluding specified folders.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        'root_dir',
        nargs='?',
        default='.',
        help='The root directory of the project to scan. Defaults to the current directory.'
    )
    parser.add_argument(
        '-e', '--exclude',
        nargs='+',
        help='Additional directories or files to exclude.\n'
             'Example: -e my_dist_folder another_folder'
    )
    parser.add_argument(
        '-o', '--output',
        help='Path to an output file to save the tree structure.\n'
             'Example: -o tree.txt'
    )

    args = parser.parse_args()
    
    root_path = Path(args.root_dir).resolve()

    if not root_path.is_dir():
        print(f"Error: Directory not found at '{root_path}'")
        return

    exclude_dirs = DEFAULT_EXCLUDE_DIRS.copy()
    exclude_files = DEFAULT_EXCLUDE_FILES.copy()
    if args.exclude:
        for item in args.exclude:
            if '.' in Path(item).name and not item.startswith('.'):
                exclude_files.add(item)
            else:
                exclude_dirs.add(item)

    print(f"Generating tree for: {root_path}\n")

    tree_lines = []
    total_dirs, total_files = 0, 0
    
    tree_lines.append(f"{root_path.name}/")

    tree_generator_instance = generate_tree(
        root_path,
        exclude_dirs=exclude_dirs,
        exclude_files=exclude_files
    )

    for result in tree_generator_instance:
        if isinstance(result, tuple) and result[0] is None:
            _, d_count, f_count = result
            total_dirs += d_count
            total_files += f_count
        else:
            tree_lines.append(result)
    
    summary = f"\n{total_dirs} directories, {total_files} files"
    tree_lines.append(summary)
    
    final_output = "\n".join(tree_lines)
    
    if args.output:
        try:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(final_output)
            print(f"Directory structure successfully saved to '{args.output}'")
        except IOError as e:
            print(f"Error writing to file '{args.output}': {e}")
    else:
        print(final_output)


if __name__ == '__main__':
    main()