package com.mahfazty.smart.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        TransactionEntity::class, GoalEntity::class, SavingsEntity::class,
        SettingEntity::class, ClientEntity::class, AccountEntity::class,
        OperationEntity::class, TransferEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao
    abstract fun goalDao(): GoalDao
    abstract fun savingsDao(): SavingsDao
    abstract fun settingsDao(): SettingsDao
    abstract fun clientDao(): ClientDao
    abstract fun accountDao(): AccountDao
    abstract fun operationDao(): OperationDao
    abstract fun transferDao(): TransferDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "mahfazty.db",
                )
                    .fallbackToDestructiveMigration()
                    .build()
                    .also { INSTANCE = it }
            }
    }
}
