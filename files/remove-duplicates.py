def remove_duplicate_lines_in_place(filename):
    with open(filename, "r", encoding="utf-8") as file:
        unique_lines = list(dict.fromkeys(file.readlines()))  # Preserves order

    with open(filename, "w", encoding="utf-8") as file:
        file.writelines(unique_lines)

# Usage
remove_duplicate_lines_in_place("lorem-ipsum.txt")