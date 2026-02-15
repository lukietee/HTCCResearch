#!/usr/bin/env python3
"""Remove thumbnail files and DB records for specified channels."""

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import or_
from app.core.config import settings
from app.core.db import init_db, SessionLocal
from app.models.thumbnail import Thumbnail


# Each entry: (display_name, [db_channel_names], [file_name_patterns])
# file_name_patterns match anywhere in filename (case-insensitive regex)
CHANNELS_TO_REMOVE = [
    ("MKBHD", ["MKBHD", "Marques Brownlee"], [r"MKBHD_", r"Marques Brownlee_", r"_MKBHD_", r"_Marques Brownlee_"]),
    ("Linus Tech Tips", ["Linus Tech Tips"], [r"Linus Tech Tips_", r"LinusTechTips_", r"_Linus Tech Tips_", r"_LinusTechTips_"]),
    ("Unbox Therapy", ["Unbox Therapy"], [r"Unbox Therapy_", r"UnboxTherapy_", r"_Unbox Therapy_", r"_UnboxTherapy_"]),
    ("JerryRigEverything", ["JerryRigEverything"], [r"JerryRigEverything_", r"_JerryRigEverything_"]),
    ("Vsauce", ["Vsauce"], [r"Vsauce_", r"_Vsauce_"]),
    ("Veritasium", ["Veritasium"], [r"Veritasium_", r"_Veritasium_"]),
    ("SmarterEveryDay", ["SmarterEveryDay"], [r"SmarterEveryDay_", r"_SmarterEveryDay_"]),
    ("Mark Rober", ["Mark Rober"], [r"Mark Rober_", r"MarkRober_", r"_Mark Rober_", r"_MarkRober_"]),
    ("Kurzgesagt", ["Kurzgesagt", "Kurzgesagt  In a Nut"], [r"Kurzgesagt_", r"_Kurzgesagt_"]),
    ("The Slow Mo Guys", ["The Slow Mo Guys"], [r"The Slow Mo Guys_", r"TheSlowMoGuys_", r"_The Slow Mo Guys_", r"_TheSlowMoGuys_"]),
    ("Philip DeFranco", ["Philip DeFranco"], [r"Philip DeFranco_", r"PhilipDeFranco_", r"_Philip DeFranco_", r"_PhilipDeFranco_"]),
    ("Casey Neistat", ["Casey Neistat", "CaseyNeistat"], [r"Casey Neistat_", r"CaseyNeistat_", r"_Casey Neistat_", r"_CaseyNeistat_"]),
    ("Corridor Crew", ["Corridor Crew"], [r"Corridor Crew_", r"CorridorCrew_", r"_Corridor Crew_", r"_CorridorCrew_"]),
    ("Binging with Babish", ["Binging with Babish"], [r"Binging with Babish_", r"BingingwithBabish_", r"_Binging with Babish_", r"_BingingwithBabish_"]),
    ("Ali Abdaal", ["Ali Abdaal"], [r"Ali Abdaal_", r"AliAbdaal_", r"_Ali Abdaal_", r"_AliAbdaal_"]),
    ("MrBallen", ["MrBallen"], [r"MrBallen_", r"_MrBallen_"]),
    ("NikkieTutorials", ["NikkieTutorials"], [r"NikkieTutorials_", r"_NikkieTutorials_"]),
    ("Aphmau", ["Aphmau"], [r"Aphmau_", r"_Aphmau_"]),
    ("Jacksepticeye", ["Jacksepticeye", "jacksepticeye"], [r"[Jj]acksepticeye_", r"_[Jj]acksepticeye_"]),
    ("Preston", ["Preston", "PrestonPlayz"], [r"Preston_", r"PrestonPlayz_", r"_Preston_", r"_PrestonPlayz_"]),
    ("h3h3Productions", ["h3h3Productions", "H3H3Productions"], [r"[Hh]3[Hh]3[Pp]roductions_", r"_[Hh]3[Hh]3[Pp]roductions_"]),
    ("Jeffree Star", ["Jeffree Star"], [r"Jeffree Star_", r"JeffreeStar_", r"_Jeffree Star_", r"_JeffreeStar_"]),
    ("Typical Gamer", ["Typical Gamer"], [r"Typical Gamer_", r"TypicalGamer_", r"_Typical Gamer_", r"_TypicalGamer_"]),
    ("SSundee", ["SSundee"], [r"SSundee_", r"_SSundee_"]),
]


def cleanup():
    init_db()
    db = SessionLocal()

    total_files = 0
    total_records = 0

    for display_name, db_names, file_patterns in CHANNELS_TO_REMOVE:
        # Delete files from all group directories
        file_count = 0
        compiled = [re.compile(p) for p in file_patterns]
        for group_dir in settings.THUMBNAILS_DIR.iterdir():
            if not group_dir.is_dir():
                continue
            for f in group_dir.iterdir():
                if any(pat.search(f.name) for pat in compiled):
                    f.unlink()
                    file_count += 1

        # Delete DB records matching any known channel name variant
        filters = [Thumbnail.channel == name for name in db_names]
        # Also match LIKE for truncated names (e.g. "Kurzgesagt  In a Nut")
        filters.append(Thumbnail.channel.like(f"{db_names[0]}%"))
        record_count = db.query(Thumbnail).filter(or_(*filters)).delete(synchronize_session="fetch")
        db.commit()

        print(f"  {display_name}: {file_count} files, {record_count} DB records deleted")
        total_files += file_count
        total_records += record_count

    db.close()
    print(f"\nTotal: {total_files} files, {total_records} DB records deleted")


if __name__ == "__main__":
    cleanup()
