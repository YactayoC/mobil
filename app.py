import os


def print_directory_tree(root_dir, indent=""):
    for item in os.listdir(root_dir):
        path = os.path.join(root_dir, item)
        if os.path.isdir(path):
            print(f"{indent}- {item}/")
            print_directory_tree(path, indent + "  ")
        else:
            print(f"{indent}- {item}")


# Cambia esto por la ruta raíz de tu proyecto
print_directory_tree("app")
