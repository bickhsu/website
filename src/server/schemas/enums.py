from enum import Enum
from typing import Literal


class DomainEnum(str, Enum):
    WORK = "Work"
    PERSONAL = "Personal"
    SIDE_PROJECT = "Side_Project"
    UNCATEGORIZED = "Uncategorized"  

EntityType = Literal['execution_unit', 'decision_record', 'knowledge_fragment', 'strategic_hypothesis']
